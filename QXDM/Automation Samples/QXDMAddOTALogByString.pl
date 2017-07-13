# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMAddOTALogByString.pl

# This script demostrates usage of the ClientConfig automation
# interface method AddOTALogByString()

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

# Add OTA log to the client
sub AddOTALogByString
{
   my $CDMAAccessChannel = 0x1004;

   # Get a QXDM client
   my $ReqHandle = $QXDM2->RegisterQueueClient( 256 );
   if ($ReqHandle == 0xFFFFFFFF)
   {
      print "\nUnable to register a client\n";

      return;
   }

   my $Client = $QXDM2->ConfigureClientByKeys( $ReqHandle );
   if ($Client == false)
   {
      print "Unable to configure client by keys\n";

      $QXDM2->UnregisterClient( $ReqHandle );
      return;
   }

   # Register for OTA logs
   $Client->AddOTALogByString( $CDMAAccessChannel, "1" );
   $Client->AddOTALogByString( $CDMAAccessChannel, "2" );
   $Client->AddOTALogByString( $CDMAAccessChannel, "3" );
   $Client->AddOTALogByString( $CDMAAccessChannel, "4" );
   $Client->AddOTALogByString( $CDMAAccessChannel, "5" );
   $Client->CommitConfig();

   print "\nClient registered for OTA logs:\n"
       . "   [0x1004/001] Access/Registration\n"
       . "   [0x1004/002] Access/Order\n"
       . "   [0x1004/003] Access/Data Burst\n"
       . "   [0x1004/004] Access/Origination\n"
       . "   [0x1004/005] Access/Page Response\n";

   $QXDM2->UnregisterClient( $ReqHandle );
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

   # Add OTA log to the client
   AddOTALogByString();
}

Execute();