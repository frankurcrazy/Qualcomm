# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMExportViewText.pl

# This script demostrates usage of the QXDM2 automation
# interface method ExportViewText

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
   }

   SetQXDM( $QXDM );

   # Success
   $RC = true;
   return $RC;
}

# Export all items from item view to a text file
sub ExportViewText
{
   # Assume failure
   my $RC = false;

   # Create the view first
   $RC = $QXDM->CreateView( "Item View", "" );
   if ($RC == false)
   {
      print "\nFailed to create 'Item View'";

      return;
   }

   # Get path for QXDM installation
   my $FileName = GenerateFileName( "", ".txt" );
   if ($FileName eq "")
   {
      return;
   }

   # Export all items from item view
   $RC = $QXDM->ExportViewText( "Item View", $FileName );
   if ($RC == false)
   {
      print "\nUnable to export items, 'Item View' not found\n";

      return;
   }

   print "\nItems exported to item store file:\n"
       . "$FileName\n";
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

   # Export all items from item view to a text file
   ExportViewText();
}

Execute();