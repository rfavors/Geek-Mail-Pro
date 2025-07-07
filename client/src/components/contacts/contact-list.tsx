import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Edit, 
  Trash2, 
  Mail,
  Calendar,
  Users,
  UserCheck,
  UserX
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactListProps {
  contacts: any[];
  searchTerm: string;
  isLoading: boolean;
}

export function ContactList({ contacts, searchTerm, isLoading }: ContactListProps) {
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

  const filteredContacts = contacts.filter(contact => 
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(filteredContacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId: number, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    }
  };

  const getContactInitials = (contact: any) => {
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
    } else if (contact.firstName) {
      return contact.firstName[0].toUpperCase();
    } else if (contact.email) {
      return contact.email[0].toUpperCase();
    }
    return "U";
  };

  const getContactName = (contact: any) => {
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName} ${contact.lastName}`;
    } else if (contact.firstName) {
      return contact.firstName;
    }
    return contact.email;
  };

  const getStatusBadge = (contact: any) => {
    if (!contact.isActive) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <UserX className="h-3 w-3" />
          Unsubscribed
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <UserCheck className="h-3 w-3" />
        Active
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredContacts.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {searchTerm ? "No contacts found" : "No contacts yet"}
        </h3>
        <p className="text-muted-foreground mb-4">
          {searchTerm 
            ? "Try adjusting your search criteria."
            : "Start building your email list by adding contacts or importing a CSV file."
          }
        </p>
        {!searchTerm && (
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Add Your First Contact
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Add to List
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-1" />
              Send Campaign
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Contact Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedContacts.length === filteredContacts.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Lists</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                        {getContactInitials(contact)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{getContactName(contact)}</div>
                      <div className="text-sm text-muted-foreground">{contact.email}</div>
                      {contact.company && (
                        <div className="text-xs text-muted-foreground">{contact.company}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {contact.tags?.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    )) || (
                      <Badge variant="secondary" className="text-xs">Newsletter</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(contact)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(contact.subscriptionDate || contact.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredContacts.length} of {contacts.length} contacts
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
