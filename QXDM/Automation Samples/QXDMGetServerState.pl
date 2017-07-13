# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMGetServerState.pl

# This script demostrates usage of the QXDM2 automation
# interface method GetServerState

use HelperFunctions;
use Switch;

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

# Dump the server state
sub DumpServerState
{
   my $Txt = "Server State: ";

   my $ServerState = $QXDM2->GetServerState();
   switch ($ServerState)
   {
      case (SERVER_DISCONNECTED)
      {
         $Txt .= "Disconnected";
      }

      case (SERVER_PRECONNECT)
      {
         $Txt .= "Connecting";
      }

      case (SERVER_CONNECTED)
      {
         $Txt .= "Connected";
      }

      case (SERVER_PREDISCONNECT)
      {
         $Txt .= "Disconnecting";
      }

      case (SERVER_PLAYBACK)
      {
         $Txt .= "Playback";
      }

      else
      {
         $Txt .= "Unknown";
      }
   }

   print "\n$Txt\n";
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

   # Dump the server state
   DumpServerState();
}

Execute();