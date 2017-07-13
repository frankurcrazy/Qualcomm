# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMRegisterClient.pl

# This script demostrates usage of the QXDM2 automation
# interface method RegisterClient

use HelperFunctions;

# Global variables
my $QXDM;
my $QXDM2;

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

# Register for a QXDM client
sub RegisterClient
{
   # Get a QXDM client
   my $ViewName = "Client View";
   my $ViewVisible = true;
   my $ReqHandle = $QXDM2->RegisterClient( $ViewName, $ViewVisible );
   if ($ReqHandle == 0xFFFFFFFF)
   {
      print "\nUnable to register '$ViewName'";

      return;
   }

   print "\n'$ViewName' registered successfully"
       . "\n'$ViewName' visible to the user\n";

   # Display registered client to user
   my $WaitCount = 0;
   while ($WaitCount < 10)
   {
      sleep( 1 );
      $WaitCount++;
   }

   $QXDM2->UnregisterClient( $ReqHandle );

   print "'$ViewName' unregistered";

   my $ViewVisible = false;
   $ReqHandle = $QXDM2->RegisterClient( "", $ViewVisible );
   if ($ReqHandle == 0xFFFFFFFF)
   {
      print "\nUnable to register QXDM client";

      return;
   }

   print "\nQXDM client registered successfully"
       . "\nQXDM client not visible to the user";

   $QXDM2->UnregisterClient( $ReqHandle );

   print "\nQXDM client unregistered\n";
}

# Main body of script
sub Execute
{
   # Launch QXDM
   my $RC = Initialize();
   if ($RC == false)
   {
      return;
   }

   # Get QXDM version
   my $Version = $QXDM->{AppVersion};
   print "\nQXDM Version: " . $Version;

   # Register for a QXDM client
   RegisterClient();
}

Execute();