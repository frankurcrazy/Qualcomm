# NOTE: This script must be run from a command box,
# i.e.  Perl QXDMCOMPort.pl [COM Port Number]

# This script demostrates usage of the QXDM automation
# interface method COMPort

use HelperFunctions;

# Global variable
my $QXDM;

# COM port to be used for communication with the phone by QXDM
my $PortNumber = -1;

# Process the argument - port number
sub ParseArguments
{
   # Assume failure
   my $RC = false;
   my $Help = "Syntax: Perl QXDMCOMPort.pl [Optional COM Port Number]\n"
            . "Eg:     Perl QXDMCOMPort.pl 5\n";

   if ($#ARGV < 0)
   {
      # COM port is optional
      $RC = true;
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
   }

   SetQXDM( $QXDM );

   # Success
   $RC = true;
   return $RC;
}

# Obtain and dump out the COM port status
sub DumpCOMPort
{
   # Check COM port status
   my $COMPort = $QXDM->COMPort;
   if ($COMPort == -1)
   {
      print "Error occurred\n";
   }
   elsif ($COMPort == 0)
   {
      print "Disconnected state\n";
   }
   elsif ($COMPort > 0)
   {
      print "Connected to port: COM" . $COMPort . "\n";
   }
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

  if ($PortNumber != -1)
   {
      # Change the COM port
      $QXDM->{COMPort} = $PortNumber;
   }

   # Wait for change in COM port
   sleep( 2 );

   # Obtain and dump out the COM port status
   DumpCOMPort();
}

Execute();