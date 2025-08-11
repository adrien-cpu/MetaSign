import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const VideoChat = () => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const socket = useRef(null);

    useEffect(() => {
        socket.current = io('http://localhost:5000');

        const constraints = { video: true, audio: true };

        navigator.mediaDevices.getUserMedia(constraints)
            .then((userStream) => {
                setStream(userStream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = userStream;
                }

                const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
                const pc = new RTCPeerConnection(configuration);

                userStream.getTracks().forEach((track) => {
                    pc.addTrack(track, userStream);
                });

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.current.emit('candidate', event.candidate);
                    }
                };

                pc.ontrack = (event) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };

                setPeerConnection(pc);

                socket.current.on('candidate', (candidate) => {
                    pc.addIceCandidate(new RTCIceCandidate(candidate));
                });

                socket.current.on('offer', async (offer) => {
                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.current.emit('answer', answer);
                });

                socket.current.on('answer', async (answer) => {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                });

                const createOffer = async () => {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.current.emit('offer', offer);
                };

                createOffer();
            })
            .catch((error) => {
                console.error('Error accessing media devices.', error);
            });

        return () => {
            if (peerConnection) {
                peerConnection.close();
            }
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [stream, peerConnection]); // ✅ Ajout des dépendances

    return (
        <div>
            <video ref={localVideoRef} autoPlay playsInline muted />
            <video ref={remoteVideoRef} autoPlay playsInline />
        </div>
    );
};

export default VideoChat;