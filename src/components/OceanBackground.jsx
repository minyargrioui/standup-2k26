const OceanBackground = () => {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 0,
        filter: "brightness(0.65) saturate(1.3) hue-rotate(-10deg)",
      }}
    >
      <source src="/assets/ocean.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default OceanBackground;