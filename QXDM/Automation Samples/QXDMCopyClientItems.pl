# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMCopyClientItems.pl

# This example demonstrates the usage of the QXDM2 automation
# interface method CopyClientItems()

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

# Schedule version number requests
sub ScheduleRequests
{
   # Get a QXDM client
   $ReqHandle = $QXDM2->RegisterQueueClient( 256 );
   if ($ReqHandle == 0xFFFFFFFF)
   {
      print "\nUnable to create client\n";

      return;
   }

   # Schedule version number requests with 1000 ms timeout to be
   # sent every 500 ms
   my $RequestName = "Version Number Request";
   my $ReqID = $QXDM2->ClientRequestItem( $ReqHandle,
                                          $RequestName,
                                          "",
                                          true,
                                          1000,
                                          10,
                                          500 );
   if ($ReqID == 0)
   {
      print "\nUnable to schedule request - '$RequestName'\n";
      $QXDM2->UnregisterClient( $ReqHandle );

      return;
   }

   print "10 '$RequestName'"
       . "s scheduled by QXDM";
}

# Copy all/subset of items from client view to an item store file
sub CopyClientItems
{
   # Get file name from script folder path
   my $FileName = GenerateFileName( "", ".isf" );
   if ($FileName eq "")
   {
      return;
   }

   # Register a QXDM client
   my $Handle = $QXDM2->RegisterQueueClient( 256 );
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

   # Copy all items from client view
   my $RC = $QXDM2->CopyClientItems( $Handle, $FileName, 0, 0xFFFFFFFF );
   if ($RC == false)
   {
      print "\nUnable to copy client items\n";

      $QXDM2->UnregisterClient( $Handle );
      return;
   }

   print "\nAll client items copied to ISF to:\n" . $FileName;

   # Copy items from the client (overwrites ISF created above)
   $RC = $QXDM2->CopyClientItems( $Handle, $FileName, 0, 4 );
   if ($RC == false)
   {
      print "\nUnable to copy client items\n";

      $QXDM2->UnregisterClient( $Handle );
      return;
   }

   print "\nClient items (0 - 4) copied to ISF:\n$FileName\n";

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

   # Copy items from client view to an item store file
   CopyClientItems();
}

Execute();