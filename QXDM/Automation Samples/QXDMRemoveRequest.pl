# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMRemoveRequest.pl <COM Port Number>

# This script demostrates usage of the QXDM2 automation
# interface method RemoveRequest()

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
   my $Help = "Syntax: Perl QXDMRemoveRequest.pl <COM Port Number>\n"
            . "Eg:     Perl QXDMRemoveRequest.pl 5\n";

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

# Schedule and remove request
sub ManipulateRequests
{
   # Schedule a repetitive version number request with 1s timeout,
   # the request will be sent out every 500 ms until it is removed
   my $RequestName = "Version Number Request";
   my $ReqID = $QXDM2->RequestItem( $RequestName,
                                    "",
                                    true,
                                    1000,
                                    0xFFFFFFFF,
                                    500 );
   if ($ReqID == 0)
   {
      print "\nUnable to schedule request - '$RequestName'\n";

      return;
   }

   print "Request '$RequestName' scheduled by QXDM (ID " . $ReqID . ")\n";

   # Wait for the request to go out a number of times
   sleep( 5 );

   # Now remove it
   $RC = $QXDM2->RemoveRequest( $ReqID );
   if ($RC == false)
   {
      print "\nRemoveRequest failed"
          . "\nFailed to remove request ID $ReqID\n";

      return;
   }

   print "Successfully removed reuest ID $ReqID\n";
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