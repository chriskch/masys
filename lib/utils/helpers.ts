/**
 * Maps compass directions to rotation degrees.
 * 0deg = North (Up)
 */
export const getWindRotation = (dir: string): number => {
  const directions: Record<string, number> = {
    N: 0,
    NNO: 22.5,
    NO: 45,
    ONO: 67.5,
    O: 90,
    E: 90,
    OSO: 112.5,
    SO: 135,
    SSO: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5,
  };
  return directions[dir.toUpperCase()] || 0;
};
