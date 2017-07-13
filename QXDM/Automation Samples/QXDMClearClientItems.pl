# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMClearClientItems.pl

# This example demonstrates the usage of the QXDM2 automation
# interface method ClearClientItems()

use HelperFunctions;

# Global variables
my $QXDM;
my $QXDM2;

# Initialize application
sub Initialize
{
   # Assume failure
   my $RC = false;

   # Create QXDM object
   $QXDM = new Win32::OLE 'QXDM.Application';
   if ($QXDM == null)
   {
      print "\nError launching QXDM";

      return $RC;
   }

   # Create QXDM2 interface
   $QXDM2 = $QXDM->GetIQXDM2();
   if ($QXDM2 == null)
   {
      print "\nQXDM does not support required interface";

      return $RC;
   }

   SetQXDM ( $QXDM );
   SetQXDM2 ( $QXDM2 );

   # Success
   $RC = true;
   return $RC;
}

# Demonstrate clearing a client
sub ClearClient
{
   # Register a QXDM client
   $Handle = $QXDM2->RegisterQueueClient( 256 );
   if ($Handle == 0xFFFFFFFF)
   {
      print "\nUnable to create client\n";
      return;
   }

   my $Client = $QXDM2->ConfigureClientByKeys( $Handle );
   if ($Client == null)
   {
      print "\nUnable to configure client by keys\n";

      $QXDM2->UnregisterClient( $Handle );
      return;
   }

   # Register for strings
   $Client->AddItem( ITEM_TYPE_STRING );
   $Client->CommitConfig();

   print "\nAdding five strings to item store";

   # Add strings to QXDM item store
   my $Str = "";
   for (my $i = 0; $i < 5; $i++)
   {
      $Str = "Test String " . $i;
      $QXDM->QXDMTextOut( $Str );
   }

   # Output number of items in both the item store and the client
   my $ItemCount = $QXDM2->GetItemCount();
   print "\nNumber of items in item store: $ItemCount";

   $ItemCount = $QXDM2->GetClientItemCount( $Handle );
   print "\nNumber of items in client: $ItemCount";

   # Clear the client
   $RC = $QXDM2->ClearClientItems( $Handle );
   if ($RC == true)
   {  
      print "\nClient has been cleared of items";
   }
   else
   {
      print "\nUnable to clear client";
   }

   # Client should now be empty
   $ItemCount = $QXDM2->GetClientItemCount( $Handle );
   print "\nNumber of items in client: $ItemCount";

   # However, the item store is not
   $ItemCount = $QXDM2->GetItemCount();
   print "\nNumber of items in item store: $ItemCount\n";

   # Unregister the client
   $QXDM2->UnregisterClient( $Handle );
}

# Main body of script
sub Execute
{
   # Launch QXDM
   my $RC = Initialize();
   if ($RC == false)
   {
      return;
   }

   # Get QXDM version
   my $Version = $QXDM->{AppVersion};
   print "\nQXDM Version: " . $Version;

   # Demonstrate clearing a client
   ClearClient();
}

Execute();