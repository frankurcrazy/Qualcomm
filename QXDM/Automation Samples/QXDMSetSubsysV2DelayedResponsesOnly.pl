# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMSetSubsysV2DelayedResponsesOnly.pl

# This script demostrates usage of the ClientConfig automation
# interface method SetSubsysV2DelayedResponsesOnly()

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

# Configure client for delayed responses only
sub SetSubsysV2DelayedResponsesOnly
{
   # Register a QXDM client
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

   # Register for subsystem dispatch response (delayed only):
   #   "Handset/Display Capture Immediate/Delayed Response"
   $Client->AddSubsysResponse( 16, 2 );
   $Client->SetSubsysV2DelayedResponsesOnly( true );
   $Client->CommitConfig();

   print  "\nClient configured for delayed responses only\n";
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

   # Configure client for delayed responses only
   SetSubsysV2DelayedResponsesOnly();
}

Execute();