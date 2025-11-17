import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Calendar, User, Mail } from "lucide-react"
import { format } from "date-fns"

interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  status: string
  created_at: string
  note: string | null
  events: {
    title: string
    starts_at: string
  }
}

export const EventRegistrationsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['event-registrations', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('event_registrations')
        .select(`
          *,
          events(title, starts_at)
        `)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (error) throw error
      return data as EventRegistration[]
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('event_registrations')
        .update({ 
          status,
          ...(status === 'approved' && { approved_at: new Date().toISOString() }),
          ...(status === 'cancelled' && { cancelled_at: new Date().toISOString() })
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-counts'] })
      toast({
        title: "Registration updated",
        description: "The registration status has been updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update registration: ${error.message}`,
        variant: "destructive",
      })
    },
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      cancelled: "destructive",
      checked_in: "outline",
    }
    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading registrations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Registrations</h1>
          <p className="text-muted-foreground mt-1">
            Manage attendee registrations for all events
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Registrations</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
          <CardDescription>
            {registrations?.length || 0} registration{registrations?.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Attendee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Event Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations?.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{registration.events.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>User ID: {registration.user_id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(registration.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(registration.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(registration.events.starts_at), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {registration.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: registration.id,
                                status: 'approved',
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: registration.id,
                                status: 'cancelled',
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {registration.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: registration.id,
                              status: 'cancelled',
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!registrations?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No registrations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
