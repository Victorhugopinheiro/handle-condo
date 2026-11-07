export type StaffActor = {
  kind: "staff";
  id: string;
  name: string;
  email: string;
  role: "sindico" | "zelador";
};

export type ResidentActor = {
  kind: "resident";
  id: number;
  name: string;
  email: string;
  unit: string;
};

export type Actor = StaffActor | ResidentActor;

export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  code?: string;
  photoWarning?: string;
};
