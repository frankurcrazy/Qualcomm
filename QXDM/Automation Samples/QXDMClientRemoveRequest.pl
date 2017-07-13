# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMClientRemoveRequest.pl <COM Port Number>

# This script demostrates usage of the QXDM2 automation
# interface method ClientRemoveRequest()

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
   my $Help = "Syntax: Perl QXDMClientRemoveRequest.pl <COM Port Number>\n"
            . "Eg:     Perl QXDMClientRemoveRequest.pl 5\n";

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

# Schedule and remove request
sub ManipulateRequests
{
   # Create a client
   my $Handle = $QXDM2->RegisterQueueClient( 256 );
   if ($Handle == 0xFFFFFFFF)
   {
      print "\nUnable to create client\n";

      return;
   }

   # Schedule a repetitive version number request with 1s timeout,
   # the request will be sent out every 500 ms until it is removed
   my $RequestName = "Version Number Request";
   my $ReqID = $QXDM2->ClientRequestItem( $Handle,
                                          $RequestName,
                                          "",
                                          true,
                                          1000,
                                          0xFFFFFFFF,
                                          500 );
   if ($ReqID == 0)
   {
      print "Unable to schedule request - '$RequestName'\n";

      $QXDM2->UnregisterClient( $Handle );
      return;
   }

   print "Request '$RequestName' scheduled by QXDM (ID $ReqID)\n";

   # Wait for the request to go out a number of times
   sleep( 5 );

   # Now remove it
   my $RC = $QXDM2->ClientRemoveRequest( $Handle, $ReqID );
   if ($RC == false)
   {
      print "Failed to remove request ID $ReqID\n";

      $QXDM2->UnregisterClient( $Handle );
      return;
   }

   print "Successfully removed request ID $ReqID\n";

   $QXDM2->UnregisterClient( $Handle );
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

   # Schedule and remove request
   ManipulateRequests();

   # Disconnect phone
   Disconnect();
}

Execute();