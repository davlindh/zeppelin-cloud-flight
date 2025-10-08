import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, MoreHorizontal, Mail, Phone, Trash2 } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useUpdateBooking, useDeleteBooking } from '@/hooks/useBookingMutations';
import { formatCurrency } from '@/lib/utils';

interface BookingsTableProps {
  onStatusUpdate?: (id: string, status: string) => void;
}

export const BookingsTable = ({ onStatusUpdate }: BookingsTableProps) => {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  
  const { data: bookings = [], isLoading } = useBookings();
  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'in_progress': return 'outline';
      default: return 'outline';
    }
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    updateBooking.mutate({ id: bookingId, status: newStatus as any });
    if (onStatusUpdate) {
      onStatusUpdate(bookingId, newStatus);
    }
  };

  const handleDeleteClick = (bookingId: string) => {
    setBookingToDelete(bookingId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (bookingToDelete) {
      deleteBooking.mutate(bookingToDelete);
      setBookingToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading bookings...</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{booking.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.services?.title || 'Unknown Service'}</div>
                  </TableCell>
                  <TableCell>{booking.services?.provider || 'Unknown Provider'}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.selected_date}</div>
                      <div className="text-sm text-muted-foreground">{booking.selected_time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={booking.status}
                      onValueChange={(value) => handleStatusChange(booking.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          <Badge variant={getStatusVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {booking.services?.starting_price ? formatCurrency(booking.services.starting_price) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`mailto:${booking.customer_email}`)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Email Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`tel:${booking.customer_phone}`)}>
                          <Phone className="mr-2 h-4 w-4" />
                          Call Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(booking.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about this booking request
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-1">
                    <p><strong>Name:</strong> {selectedBooking.customer_name}</p>
                    <p><strong>Email:</strong> {selectedBooking.customer_email}</p>
                    <p><strong>Phone:</strong> {selectedBooking.customer_phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Service Information</h3>
                  <div className="space-y-1">
                    <p><strong>Service:</strong> {selectedBooking.services?.title}</p>
                    <p><strong>Provider:</strong> {selectedBooking.services?.provider}</p>
                    <p><strong>Duration:</strong> {selectedBooking.services?.duration}</p>
                    <p><strong>Price:</strong> {selectedBooking.services?.starting_price ? formatCurrency(selectedBooking.services.starting_price) : 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Date:</strong> {selectedBooking.selected_date}</p>
                  <p><strong>Time:</strong> {selectedBooking.selected_time}</p>
                  <p><strong>Status:</strong> 
                    <Badge variant={getStatusVariant(selectedBooking.status)} className="ml-2">
                      {selectedBooking.status}
                    </Badge>
                  </p>
                </div>
              </div>

              {selectedBooking.customer_message && (
                <div>
                  <h3 className="font-semibold mb-2">Customer Message</h3>
                  <p className="text-sm bg-muted p-3 rounded">{selectedBooking.customer_message}</p>
                </div>
              )}

              {selectedBooking.customizations && Object.keys(selectedBooking.customizations).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Customizations</h3>
                  <div className="space-y-1">
                    {Object.entries(selectedBooking.customizations).map(([key, value]) => (
                      <p key={key}><strong>{key}:</strong> {value as string}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => window.open(`mailto:${selectedBooking.customer_email}`)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Customer
                </Button>
                <Button variant="outline" onClick={() => window.open(`tel:${selectedBooking.customer_phone}`)}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Customer
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteClick(selectedBooking.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};