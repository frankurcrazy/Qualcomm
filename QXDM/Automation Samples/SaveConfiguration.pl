# NOTE: This script must be run from Perl in a command box,
# i.e.  Perl SaveConfiguration.pl

# This example demonstrates saving the QXDM configuration
# to a .DMC file

use HelperFunctions;

# Global variable
my $QXDM;

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

   SetQXDM( $QXDM );

   # Success
   $RC = true;
   return $RC;
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

   # Get file name from script folder path
   my $FileName = GenerateFileName( "", ".dmc" );
   if ($FileName eq "")
   {
      return;
   }

   # Save configuration
   $QXDM->SaveConfig( $FileName );

   print "\nQXDM configuration saved to:\n"
       . "$FileName\n";
}

Execute();