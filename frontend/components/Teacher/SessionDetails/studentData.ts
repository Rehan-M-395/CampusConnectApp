export type Student = {
  id: number;
  erpId: string;
  name: string;
  status: "Present" | "Absent";
};

export const studentData: Student[] = [
  {
    id: 1,
    erpId: "510001001",
    name: "Aarav Sharma",
    status: "Present",
  },
  {
    id: 2,
    erpId: "510001002",
    name: "Vivaan Patel",
    status: "Present",
  },
  {
    id: 3,
    erpId: "510001003",
    name: "Aditya Verma",
    status: "Absent",
  },
  {
    id: 4,
    erpId: "510001004",
    name: "Krishna Gupta",
    status: "Present",
  },
  {
    id: 5,
    erpId: "510001005",
    name: "Rohan Mehta",
    status: "Present",
  },
  {
    id: 6,
    erpId: "510001006",
    name: "Arjun Singh",
    status: "Absent",
  },
];