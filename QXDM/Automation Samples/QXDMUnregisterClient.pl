# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMUnregisterClient.pl <COM Port Number>

# This script demostrates usage of the QXDM2 automation
# interface method UnregisterClient()

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
   my $Help = "Syntax: Perl QXDMUnregisterClient.pl <COM Port Number>\n"
            . "Eg:     Perl QXDMUnregisterClient.pl 5\n";

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

# Schedule requests to be sent
sub ScheduleRequests
{
   # Assume failure
   my $RC = false;

   # Create a client
   my $Handle = $QXDM2->RegisterQueueClient( 256 );
   if ($Handle == 0xFFFFFFFF)
   {
      print "\nUnable to create client\n";

      return;
   }

   print "Client registered successfully\n";

   # Schedule version number request with 1000 ms timeout
   my $RequestName = "Version Number Request";
   my $ReqID = $QXDM2->ClientRequestItem( $Handle,
                                          $RequestName,
                                          "",
                                          true,
                                          1000,
                                          1,
                                          1 );
   if ($ReqID == 0)
   {
      print "\nUnable to schedule request - '$RequestName'\n";

      $QXDM2->UnregisterClient( $Handle );
      return;
   }

   print "'$RequestName' scheduled by QXDM\n";

   # Wait for the response
   sleep( 2 );

    # Get number of items in client
   my $ItemCount = $QXDM2->GetClientItemCount( $Handle );
   if ($ItemCount == 0)
   {
      print "\nError getting client item count\n";

      return;
   }

   print "Number of items in client view is $ItemCount\n";

   $RC = $QXDM2->UnregisterClient( $Handle );
   if ($RC == false)
   {
      print "\nUnregisterClient failed\n";
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

   # Connect to our desired port
   $RC = Connect( $PortNumber );
   if ($RC == false)
   {
      return;
   }

   # Schedule requests using "ClientRequestItem"
   ScheduleRequests();

   # Disconnect phone
   Disconnect();
}

Execute();