# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMClearConfig.pl

# This script demostrates usage of the ClientConfig automation
# interface method ClearConfig()

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

# Manipulate client configuration
sub ManipulateClientConfig
{
   # Get a QXDM client
   my $Handle = $QXDM2->RegisterQueueClient( 256 );
   if ($Handle == 0xFFFFFFFF)
   {
      print "\nUnable to register a client\n";

      return;
   }

   my $Client = $QXDM2->ConfigureClientByKeys( $Handle );
   if ($Client == false)
   {
      print "Unable to configure client by keys\n";

      $QXDM2->UnregisterClient( $Handle );
      return;
   }

   # Configure client for log
   my $LogCode = 0x1019;
   $Client->AddLog( $LogCode );
   $Client->CommitConfig();

   print  "\nClient configured log code ";
   printf " 0x%X", $LogCode;

   # Now empty out the client config and reconfigure
   $Client->ClearConfig();
   print "\nClient configuration successfully cleared\n";

   # Configure client for event
   my $EventID = 256;
   $Client->AddEvent( $EventID );
   $Client->CommitConfig();

   print  "Client configured for event ID $EventID\n";

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

   # Manipulate client configuration
   ManipulateClientConfig();
}

Execute();