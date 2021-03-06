# NOTE: This script must be run from a command box,
# i.e.  Perl QXDMOfflineDigital.pl <COM Port Number>

# NOTE: This function has been duplicated from the script
# library solely for the purposes of demonstration

# This script demostrates usage of the QXDM automation
# interface method OfflineDigital

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
   my $Help = "Syntax: Perl QXDMOfflineDigital.pl <COM Port Number>\n"
            . "Eg:     Perl QXDMOfflineDigital.pl 5\n";

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

# Set phone offline
sub PhoneOffline
{
   # Assume failure
   my $RC = false;

   print( "Set phone offline ... " );

   # We need to be connected for this to work
   my $ServerState = $QXDM2->GetServerState();
   if ($ServerState != SERVER_CONNECTED)
   {
      print( "failed (not connected)\n" );
      return $RC;
   }

   my $Status = $QXDM->OfflineDigital();
   if ($Status == 1)
   {
      print( "succeeded\n" );
      $RC = true;
   }
   else
   {
      print( "failed\n" );
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

   # Set phone offline
   PhoneOffline();   

   # Reset the phone
   ResetPhone();

   # Disconnect phone
   Disconnect();
}

Execute();