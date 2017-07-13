# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMClientRequestNVWrite.pl <COM Port Number>

# This script demostrates usage of the QXDM2 automation
# interface method ClientRequestNVWrite()

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
   my $Help = "Syntax: Perl QXDMClientRequestNVWrite.pl <COM Port Number>\n"
            . "Eg:     Perl QXDMClientRequestNVWrite.pl 5\n";

   if ($#ARGV < 0)
   {
      print "\n$Help\n";
      return $RC;
   }

   $PortNumber = $ARGV[0];
   if ($PortNumber < 1 || $PortNumber > 100)
   {
      print "\nInvalid port number\n"
          . "\n$Help\n";
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

# Schedule request to be sent
sub ScheduleRequest
{
   # Create a client
   my $ReqHandle = $QXDM2->RegisterQueueClient( 256 );
   if ($ReqHandle == 0xFFFFFFFF)
   {
      print "\nUnable to create client\n";

      return;
   }

   # Schedule banner request with 1000 ms timeout
   my $RequestName = "banner";
   my $ReqID = $QXDM2->ClientRequestNVWrite( $ReqHandle,
                                             $RequestName,
                                             "QXDM Pro",
                                             true,
                                             1000 );
   if ($ReqID == 0)
   {
      print "Unable to schedule NV write request - '$RequestName'\n";

      $QXDM2->UnregisterClient( $ReqHandle );
      return;
   }

   print "NV write request '$RequestName' scheduled by QXDM\n";

   $QXDM2->UnregisterClient( $ReqHandle );
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

   # Schedule request using "ClientRequestNVWrite"
   ScheduleRequest();

   # Disconnect phone
   Disconnect();
}

Execute();