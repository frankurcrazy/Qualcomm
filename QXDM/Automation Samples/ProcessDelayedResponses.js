// This sample demonstrates using ProcessItem() to filter Subsystem Dispatch
// V2 Delayed Response items through QXDM automation.  Support is implemented
// using the Microsoft(TM) Windows Scripting engine interface model 
// (IActiveScript).
//
// Setup:
//    Configure the context menu of a scrolling view that contains delayed
//    response items (Refer to Process Items, QXDM User Guide).
//    Script Engine: JScript Language
//    Script Path:   Browse Path to ProcessDelayedResponses.js.

function ProcessItem( Item )
{
   var Ret = false;
   if (Item.GetItemType() != 9)
   {
      // Has to be a subsystem dispatch response
      return Ret;
   }

   // Parse out the command code (UINT8, 8 bits, from bit offset [header] 0)
   var CC = Item.GetItemFieldValue( 2, 8, 0, true );
   if (CC != 128)
   {
      // We only care about V2 subsystem dispatch responses
      return Ret;
   } 

   // Parse out the status (UINT32, 32 bits, from bit offset [header] 32)
   var Status = Item.GetItemFieldValue( 6, 32, 32, true );
   if (Status != 0)
   {
      // We don't care about errors
      return Ret;
   }

   // Parse out the ID (UINT16, 16 bits, from bit offset [header] 64)
   var ID = Item.GetItemFieldValue( 4, 16, 64, true );
   if (ID == 0)
   {
      // We don't care about immediate responses
      return Ret;
   }

   // Parse out the count (UINT16, 16 bits, from bit offset [header] 80)
   var Count = Item.GetItemFieldValue( 4, 16, 80, true );
   if (Count == 0 || Count == 0x8000)
   {
      // We don't care about immediate responses
      return Ret;
   }

   // Something we care about
   Ret = true;
   return Ret;
}  

