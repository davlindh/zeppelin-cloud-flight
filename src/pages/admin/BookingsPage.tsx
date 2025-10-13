import { BookingsTable } from '@/components/admin/bookings/BookingsTable';

export const BookingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">Manage service bookings and appointments</p>
      </div>
      <BookingsTable />
    </div>
  );
};
