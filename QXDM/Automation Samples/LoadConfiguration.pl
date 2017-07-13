# NOTE: This script must be run from Perl in a command box,
# i.e.  Perl LoadConfiguration.pl

# This example demonstrates loading the QXDM configuration
# from an example .DMC file

use HelperFunctions;

# Global variable
my $QXDM;

# Get file name from script folder path
sub GetFileName
{
   my $FileName = "";
   my $FolderPath = GetPathFromScript();

   # Configuration file name
   $FileName = $FolderPath."Bluetooth.dmc";
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

   # Generate output configuration file name
   my $FileName = GetFileName();
   if ($FileName eq "")
   {
      return;
   }

   print "\nLoading configuration file:\n"
       . "$FileName\n";

   # Load existing configuration
   $QXDM->LoadConfig( $FileName );
}

Execute();