export type Person = {
  personId: number;
  vorname: string;
  nachname: string;
  rolle: string;
  email?: string;
};

export const buildPersonFromName = (
  userId: number,
  name: string,
  rolle: string,
  email?: string
): Person => {
  const parts = name.split(" ");
  const vorname = parts.shift() ?? name;
  const nachname = parts.join(" ") || "";
  return { personId: userId, vorname, nachname, rolle, email };
};
