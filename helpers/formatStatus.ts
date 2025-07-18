import { CONNECTED, REJECTED, PENDING } from "@/lib/constants";

export function formatStatus(status: string) {
  switch (status) {
    case CONNECTED:
      return "Connected";
    case REJECTED:
      return "Rejected";
    case PENDING:
      return "Pending";
    default:
      return "Created";
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case CONNECTED:
      return "bg-green-100 text-green-800";
    case REJECTED:
      return "bg-red-100 text-red-800";
    case PENDING:
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
