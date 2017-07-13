# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMSyncToItems.pl

# This example demonstrates the usage of the QXDM2 automation
# interface methods SyncToItem() amd SyncToClientItem()

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

# Demonstrate syncing views to items
sub SyncToItems
{
   # Make ure the 'Item View' is up
   my $RC = $QXDM->CreateView( "Item View", "" );
   if ($RC == false)
   {
      print "\nFailed to create 'Item View'\n";
      return;
   }

   # Register a QXDM client
   my $Handle = $QXDM2->RegisterQueueClient( 512 );
   if ($Handle == 0xFFFFFFFF)
   {
      print "\nUnable to create client";
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

   print "\nAdding 300 strings to item store";

   # Add strings to QXDM item store
   my $Str = "";
   for (my $i = 0; $i < 300; $i++)
   {
      $Str = "Test String " . $i;
      $QXDM->QXDMTextOut( $Str );
   }

   # Wait for items to show up in 'Item View'
   sleep( 2 );

   # Sync to last overall item
   my $ItemCount = $QXDM2->GetItemCount();
   if ($ItemCount == 0)
   {
      print "\nUnable to obtain item count\n";

      $QXDM2->UnregisterClient( $Handle );
      return;
   }

   $RC = $QXDM2->SyncToItem( $ItemCount - 1, true );
   if ($RC == false)
   {
      print "\nUnable to sync to item " . ($ItemCount - 1) . "\n";

      $QXDM2->UnregisterClient( $Handle );
      return;
   }

   print "\nViews are now synchronized to item " . ($ItemCount - 1);

   # Wait for a bit
   sleep( 5 );

   # Sync to first item in client
   $RC = $QXDM2->SyncToClientItem( $Handle, 0, true);
   if ($RC == false)
   {
      print "\nUnable to sync to client item 0\n";

      $QXDM2->UnregisterClient( $Handle );
      return;
   }

   print "\nViews are now synchronized to client item 0\n";

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

   # Demonstrate syncing views to items
   SyncToItems();
}

Execute();