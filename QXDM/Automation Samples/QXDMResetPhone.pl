# NOTE: This script must be run from a command box,
# i.e.  Perl QXDMResetPhone.pl <COM Port Number>

# NOTE: This function has been duplicated from the script
# library solely for the purposes of demonstration

# This script demostrates usage of the QXDM automation
# interface method ResetPhone

use HelperFunctions;

# Global variables
my $QXDM;
my $QXDM2;

# COM port to be used for communication with the phone by QXDM
my $PortNumber = "";

# Process the argument - port number
sub ParseArguments
{
   # Assume failure
   my $RC = false;
   my $Help = "Syntax: Perl QXDMResetPhone.pl <COM Port Number>\n"
            . "Eg:     Perl QXDMResetPhone.pl 5\n";

   if ($#ARGV < 0)
   {
      print "\n$Help\n";
      return $RC;
   }

   $PortNumber = $ARGV[0];
   if ($PortNumber < 1 || $PortNumber > 100)
   {
      print "\nInvalid port number\n";
      print "\n$Help\n";
      return $RC;
   }

   # Success
   $RC = true;
   return $RC;
}

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

# Attempt to reset the phone and wait for it to come back up
sub ResetPhone
{
   # Assume failure
   my $RC = false;

   print "Reset phone ... ";
   
   # We need to be connected for this to work
   my $ServerState = $QXDM2->GetServerState();
   if ($ServerState != SERVER_CONNECTED)
   {
      print "failed (not connected)\n";
      return $RC;
   }

   # Reset the phone
   my $Status = $QXDM->ResetPhone();
   if ($Status == 1)
   {
      print "succeeded\n";
      $RC = true;
   }
   else
   {
      print "failed\n";
      return $RC;
   }

   print "Waiting for phone to restart ... ";

   # The phone should first disconnect
   my $WaitCount = 0;
   $ServerState = SERVER_CONNECTED;
   while ($ServerState != SERVER_DISCONNECTED && $WaitCount < 5)
   {
      sleep( 1 );

      $ServerState = $QXDM2->GetServerState();
      $WaitCount++;
   }

   if ($ServerState != SERVER_DISCONNECTED)
   {
      print "failed\n";
      return $RC;
   }

   # Now wait until DIAG server state transitions back to connected
   # (we do this for up to twenty seconds)
   $WaitCount = 0;
   $ServerState = SERVER_DISCONNECTED;
   while ($ServerState != SERVER_CONNECTED && $WaitCount < 20)
   {
      sleep( 1 );

      $ServerState = $QXDM2->GetServerState();
      $WaitCount++;
   }

   if ($ServerState == SERVER_CONNECTED)
   {
      print "succeeded\n";
      $RC = true;
   }
   else
   {
      print "failed\n";
   }

   return $RC;
}

# Main body of script
sub Execute
{
   # Parse out arguments
   my $RC = ParseArguments();
   if ($RC == false)
   {
      return;
   }

   # Launch QXDM
   $RC = Initialize();
   if ($RC == false)
   {
      return;
   }

   # Get QXDM version
   my $Version = $QXDM->{AppVersion};
   print "\nQXDM Version: " . $Version . "\n";

   # Connect to our desired port
   $RC = Connect( $PortNumber );
   if ($RC == false)
   {
      return;
   }

   # The phone will only reset if we first go offline
   PhoneOffline();

   # Reset phone
   ResetPhone();

   # Disconnect phone
   Disconnect();
}

Execute();