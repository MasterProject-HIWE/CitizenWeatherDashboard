export default function fisheye(distortion = 2, radius = 200) {
    const e = Math.exp(distortion)
    let k0 = e / (e - 1) * radius;
    let k1 = distortion / radius;
  
    return origin => item => {
      const dx = item.x - origin.x;
      const dy = item.y - origin.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      // too far away ? don't apply anything
      if (!distance || distance >= radius) {
        return {
          x: item.x,
          y: item.y,
          scale: distance >= radius ? 1 : 10,
        };
      }
  
      const k = k0 * (1 - Math.exp(-distance * k1)) / distance * .75 + .25;
      return {
        x: origin.x + dx * k,
        y: origin.y + dy * k,
        scale: Math.min(k, 10),
      };
    }
  }