export type GatePassCreateRequest = {
  parent_name: string;
  num_persons: number;
  visit_date: string;
  visit_time: string;
  phone: string;
  email: string;
  reason: string;
};

export type GatePassRecord = {
  id: string;
  teacher_erpid: string;
  teacher_name: string;
  guard_erpid: string | null;
  guard_name: string | null;
  parent_name: string;
  num_persons: number;
  visit_date: string;
  visit_time: string;
  phone: string;
  email: string;
  reason: string;
  generated_at: string;
  qr_scanned: number;
  in_time: string | null;
  out_time: string | null;
};
