# NOTE: This script must be run from Perl in a command box,
# i.e. Perl PreferredRoamingList.pl <Port Number>

# This example demonstrates usage of reading
# Preferred Roaming List using QXDM and QPST automation

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
   my $Help = "Syntax: Perl PreferredRoamingList.pl <COM Port Number>\n"
            . "Eg:     Perl PreferredRoamingList.pl 5\n";

   if ($#ARGV < 0)
   {
      print "\n$Help\n";
      return $RC;
   }

   $PortNumber = $ARGV[0];
   if ($PortNumber < 0 || $PortNumber > 100)
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

# Get the preferred roaming list
sub GetRoamingList
{
   # Assume failure
   my $RC = false;

   # Get unique PRL file name
   my $FileName = GenerateFileName( "", ".prl" );
   if ($FileName eq "")
   {
      return;
   }

   # Interface to QPST
   my $QPST = new Win32::OLE 'QPSTAtmnServer.Application';
   if ($QPST == null)
   {
      print "\nError interfacting to QPST";
      return $RC;
   }

   my $PortName = "COM" . $PortNumber;
   my $QPSTPort = $QPST->GetPort( $PortName );
   if($QPSTPort == null)
   {
      print "\nError obtaining port from QPST\n";

      $QPST->Quit();
      return $RC;
   }

   # Get service provisioning object
   my $Provisioning = $QPSTPort->Provisioning;
   if ($Provisioning == null)
   {
      print "\nFailed to obtain provisioning object\n";

      $QPST->Quit();
      return $RC;
   }

   # Send SPC(service provisioning code) to the mobile to unlock it
   $QPSTPort->SendSPC( "000000" );

   print "Set the SPC";

   # NAM
   my $Index = 0;

   # Parameters for GetPRL() NAM, PRL File Path
   $Provisioning->GetPRL( $Index, $FileName );

   print "\nDownloading PRL to:\n";
   print "$FileName\n";

   # One has to explicitly ask QPST automation to exit
   $QPST->Quit();
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
   $RC = PhoneOffline();
   if ($RC == false)
   {
      return;
   }

   # Get preferred roaming list
   GetRoamingList();

   # Reset phone
   ResetPhone();

   # Disconnect phone
   Disconnect();
}

Execute();