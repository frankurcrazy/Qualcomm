# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMConfigureClientByNames.pl

# This script demostrates usage of the QXDM2 automation
# interface method ConfigureClientByNames

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

# Configure clinet by names
sub ConfigureClient
{
   # Constants
   my $LogName1 = "General Temporal Analyzer";
   my $LogName2 = "Active Set";

   # Get a QXDM client
   my $ReqHandle = $QXDM2->RegisterClient( "", false );
   if ($ReqHandle == 0xFFFFFFFF)
   {
      print "\nUnable to register a client\n";

      return;
   }

   my $DiagEntities = "\"" . $LogName1 . "\" \"" . $LogName2 . "\"";
   my $Client = $QXDM2->ConfigureClientByNames( $ReqHandle, $DiagEntities );
   if ($Client == false)
   {
      print "Unable to configure client by names\n"
          . "ConfigureClientByNames failed\n";

      $QXDM2->UnregisterClient( $ReqHandle );

      return;
   }

   print "ConfigureClientByNames succeeded\n"
       . "Client configured by names for:\n"
       . "   \'$LogName1\' and \'$LogName2\'\n";

   $QXDM2->UnregisterClient( $ReqHandle );
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
   print "\nQXDM Version: " . $Version . "\n";

   # Configure client using "ConfigureClientByNames"
   ConfigureClient();
}

Execute();