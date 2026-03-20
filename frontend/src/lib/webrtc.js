// WebRTC Configuration
export const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const createPeerConnection = (onIceCandidate, onTrack) => {
  const pc = new RTCPeerConnection(iceServers);

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };

  pc.ontrack = (event) => {
    if (event.streams && event.streams[0]) {
      onTrack(event.streams[0]);
    } else {
      // Fallback for browsers that don't provide streams in the event
      onTrack(new MediaStream([event.track]));
    }
  };

  return pc;
};
