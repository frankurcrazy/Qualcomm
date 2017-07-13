# NOTE: This script must be run from a command box,
# i.e.  Perl QXDMGPSPort.pl [GPS Port Number]

# This script demostrates usage of the QXDM automation
# interface method GPSPort()

use HelperFunctions;

# Global variable
my $QXDM;

# GPS port to be used for communication with the phone by QXDM
my $PortNumber = -1;

# Process the argument - port number
sub ParseArguments
{
   # Assume failure
   my $RC = false;
   my $Help = "Syntax: Perl QXDMGPSPort.pl [Optional GPS Port Number]\n"
            . "Eg:     Perl QXDMGPSPort.pl 5\n";

   if ($#ARGV < 0)
   {
      # GPS port is optional
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
      print "\nError launching QXDM\n";
   }

   SetQXDM( $QXDM );

   # Success
   $RC = true;
   return $RC;
}

# Obtain and dump out the GPS port status
sub DumpGPSPort
{
   # Check GPS port status
   my $GPSPort = $QXDM->GPSPort;
   if ($GPSPort == -1)
   {
      print "Error occurred\n";
   }
   elsif ($GPSPort == 0)
   {
      print "GPS not connected\n";
   }
   elsif ($GPSPort > 0)
   {
      print "Connected to GPS port: COM" . $GPSPort . "\n";
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
      # Change the GPS port
      $QXDM->{GPSPort} = $PortNumber;
   }

   # Wait for change in GPS port
   sleep( 2 );

   # Obtain and dump out the GPS port status
   DumpGPSPort();
}

Execute();