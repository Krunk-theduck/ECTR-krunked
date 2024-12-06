# ECTR-krunked
A krunked version of the popular web extension Extreme Car Traffic Racing


## Current Findings  
### Currency System  
The money variable is suspected to be one of the following types:
- int32: Common for handling integer-based values like currency.
- uint32: Used if the game prevents negative balances.  
  
- The variable may be dynamic (its memory location changes with each boot) or stored in an unexpected format.
- Memory scans for int32 values have yet to yield consistent results, suggesting either dynamic memory allocation or non-standard storage.
