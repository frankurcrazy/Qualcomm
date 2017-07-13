# NOTE: This script must be run with Perl in a command box, 
# i.e.  Perl QXDMRequestItem.pl <COM Port Number>

# This script demostrates usage of the QXDM2 automation
# interface method RequestItem

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
   my $Help = "Syntax: Perl RequestItem.pl <COM Port Number>\n"
            . "Eg:     Perl RequestItem.pl 5\n";

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

# Get file name from QXDM installation path
sub GetFileName
{
   my $FileName = "";
   my $QXDMFolderPath = GetPathFromScript();
   if (QXDMFolderPath eq "")
   {
      print "\nUnable to obtain QXDM path";
      return $FileName;
   }

   # The above returns the path to the QXDM executable so we need to 
   # go up one folder
   $QXDMFolderPath =~ s/\\bin/\\Automation/i;

   # Emulate handset keypress request file name
   $FileName = $QXDMFolderPath."InfoButtonPress.txt";
   return $FileName;
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
   # Schedule version number request with 1000 ms timeout
   my $RequestName = "Version Number Request";
   my $ReqID = $QXDM2->RequestItem( $RequestName,
                                    "",
                                    true,
                                    1000,
                                    1,
                                    1 );
   if ($ReqID == 0)
   {
      print "RequestItem failed"
          . "\nUnable to schedule request - '$RequestName'\n";

      return;
   }

   print "RequestItem succeeded"
       . "\n'$RequestName' scheduled by QXDM\n";

   # Schedule request for 'Info' button to be pressed on
   # the phone with 500 ms timeout
   $RequestName = "Emulate Handset Keypress Request";
   $ReqID = $QXDM2->RequestItem( $RequestName,
                                 "0 112",
                                 true,
                                 500,
                                 1,
                                 1 );
   if ($ReqID == 0)
   {
      print "RequestItem failed"
          . "\nUnable to schedule request - '$RequestName'\n";

      return;
   }

   print "RequestItem succeeded"
       . "\n'$RequestName' scheduled by QXDM\n"
       . "Request arguments are: 0 112\n";

   # Schedule request for 'Info' button to be pressed on
   # the phone with 2000 ms timeout and get the request
   # arguments from a file
   my $FileName = GetFileName();
   if ($FileName eq "")
   {
      return;
   }

   $ReqID = $QXDM2->RequestItem( $RequestName,
                                 $FileName,
                                 false,
                                 2000,
                                 1,
                                 1 );
   if ($ReqID == 0)
   {
      print "RequestItem failed"
          . "\nUnable to schedule request - '$RequestName'\n";

      return;
   }

   print "RequestItem succeeded"
       . "\n'$RequestName' scheduled by QXDM\n"
       . "Request argument is a file: \n"
       . "$FileName\n";

   # Schedule version number requests with 1000 ms timeout
   # and with frequency of 2000 ms
   $RequestName = "Version Number Request";
   $ReqID = $QXDM2->RequestItem( $RequestName,
                                 "",
                                 true,
                                 1000,
                                 2,
                                 2000 );
   if ($ReqID == 0)
   {
      print "RequestItem failed"
          . "\nUnable to schedule request - '$RequestName'\n";

      return;
   }

   print "RequestItem succeeded"
       . "\n'$RequestName' scheduled by QXDM with 2s frequency\n";

   # Wait for all the requests to go through
   my $WaitCount = 0;
   while ($WaitCount < 10)
   {
      sleep( 1 );
      $WaitCount++;
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
   my $RC = Initialize();
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

   # Schedule requests using "RequestItem"
   ScheduleRequests();

   # Disconnect phone
   Disconnect();
}

Execute();