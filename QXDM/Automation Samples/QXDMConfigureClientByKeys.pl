# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMConfigureClientByKeys.pl

# This script demostrates usage of the QXDM2 automation
# interface method ConfigureClientByKeys

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

# Configure clinet by keys
sub ConfigureClient
{
   # Constants
   my $LogCode = 0x1019;
   my $LogName = "General Temporal Analyzer";

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
      print "Unable to configure client by keys\n"
          . "ConfigureClientByKeys failed\n";

      $QXDM2->UnregisterClient( $ReqHandle );

      return;
   }

   # Configure client for log
   $Client->AddLog( $LogCode );
   $Client->CommitConfig();

   print  "\nConfigureClientByKeys succeeded\n"
       .  "Client configured by keys for:\n";
   printf "   0x%X $LogName\n", $LogCode;

   $QXDM2->UnregisterClient( $ReqHandle );

   return;
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

   # Configure client using "ConfigureClientByKeys"
   ConfigureClient();
}

Execute();