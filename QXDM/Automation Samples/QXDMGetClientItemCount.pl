# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMGetClientItemCount.pl <COM Port Number>

# This example demonstrates the usage of the QXDM2 automation
# interface method GetClientItemCount()

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
      print "\nError launching QXDM\n";

      return $RC;
   }

   # Create QXDM2 interface
   $QXDM2 = $QXDM->GetIQXDM2();
   if ($QXDM2 == null)
   {
      print "\nQXDM does not support required interface\n";

      return $RC;
   }

   SetQXDM ( $QXDM );
   SetQXDM2 ( $QXDM2 );

   # Success
   $RC = true;
   return $RC;
}

# Demonstrate obtaining the number of items in a client
sub GetClientItemCount
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

    # Output number of items in the client
   my $ItemCount = $QXDM2->GetClientItemCount( $Handle );

   print "\nNumber of items in client: $ItemCount\n";

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

   # Demonstrate obtaining the number of items in a client
   GetClientItemCount();
}

Execute();