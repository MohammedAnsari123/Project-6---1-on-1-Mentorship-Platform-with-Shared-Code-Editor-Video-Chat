import { useEffect, useRef, useState } from 'react';
import socket from '../lib/socket';
import { createPeerConnection } from '../lib/webrtc';

export const useWebRTC = (sessionId, localStream, user) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const pcRef = useRef(null);
  const candidatesQueue = useRef([]);
  const makingOffer = useRef(false);
  const ignoreOffer = useRef(false);

  useEffect(() => {
    if (!sessionId || !localStream) return;

    pcRef.current = createPeerConnection(
      (candidate) => {
        socket.emit('webrtc-ice-candidate', { sessionId, candidate });
      },
      (remote) => {
        console.log('Remote stream received:', remote.id);
        setRemoteStream(remote);
      }
    );

    pcRef.current.onconnectionstatechange = () => {
      console.log('WebRTC Connection State:', pcRef.current.connectionState);
      if (pcRef.current.connectionState === 'failed') {
        // Option to restart ice
        pcRef.current.restartIce();
      }
    };

    // Add local tracks
    localStream.getTracks().forEach((track) => pcRef.current.addTrack(track, localStream));

    pcRef.current.onnegotiationneeded = async () => {
      try {
        makingOffer.current = true;
        await pcRef.current.setLocalDescription();
        socket.emit('webrtc-offer', { sessionId, sdp: pcRef.current.localDescription });
      } catch (err) {
        console.error('Negotiation error:', err);
      } finally {
        makingOffer.current = false;
      }
    };

    socket.on('webrtc-offer', async ({ sdp }) => {
      if (!pcRef.current) return;
      try {
        const description = new RTCSessionDescription(sdp);
        const offerCollision = (description.type === 'offer') &&
                               (makingOffer.current || pcRef.current.signalingState !== 'stable');

        ignoreOffer.current = (!user?.role === 'mentor') && offerCollision; 
        if (ignoreOffer.current) return;

        await pcRef.current.setRemoteDescription(description);
        
        while (candidatesQueue.current.length > 0) {
          const cand = candidatesQueue.current.shift();
          await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
        }

        if (description.type === 'offer') {
          await pcRef.current.setLocalDescription();
          socket.emit('webrtc-answer', { sessionId, sdp: pcRef.current.localDescription });
        }
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    socket.on('webrtc-answer', async ({ sdp }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        while (candidatesQueue.current.length > 0) {
          const cand = candidatesQueue.current.shift();
          await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
        }
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    });

    socket.on('webrtc-ice-candidate', async ({ candidate }) => {
      if (!pcRef.current) return;
      if (candidate) {
        try {
          if (pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            candidatesQueue.current.push(candidate);
          }
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    });

    socket.on('peer-joined', () => {
      console.log('Peer joined room');
      // If we are already connected, we might need to re-verify or force re-negotiation
    });

    return () => {
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-ice-candidate');
      socket.off('peer-joined');
      if (pcRef.current) {
         pcRef.current.close();
         pcRef.current = null;
      }
    };
  }, [sessionId, localStream, user]);

  return { remoteStream, pc: pcRef.current };
};
