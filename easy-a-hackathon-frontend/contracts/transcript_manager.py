# MetaCAMPUS Badge Management Smart Contract for Algorand
# This PyTeal contract manages student badges and academic credentials on the Algorand blockchain

from pyteal import (
    Bytes, Int, Expr, Return, Seq, App,
    Txn, Global, Assert, Concat, Mode,
    compileTeal, TealType, Cond, If, And,
    Itob
)

def approval_program() -> Expr:
    """
    Main approval program for the MetaCAMPUS Badge Management smart contract.
    
    Handles:
<<<<<<< HEAD
    - Student onboarding (creating unique student records)
    - Transcript updates (adding/modifying academic data)
    - Transcript verification (reading blockchain data)
    
    Returns:
        Expr: A PyTeal expression representing the approval program
    
    Note:
        All operations are atomic and stateless between calls
        Box storage is used for larger data items
        Global state is used for contract metadata
=======
    - Badge request creation and management
    - Badge approval workflow
    - Badge minting and issuance
    - Badge verification
>>>>>>> bd4644f51370fddfbec2924ffeb18dfd08d3dcb1
    """
    
    # Application state keys
    badge_request_key = Bytes("badge_request")
    badge_data_key = Bytes("badge_data")
    badge_hash_key = Bytes("badge_hash")
    institution_key = Bytes("institution")
    timestamp_key = Bytes("timestamp")
    
    # Handle different application calls
    on_creation = Seq([
        App.globalPut(Bytes("contract_version"), Bytes("2.0")),
        App.globalPut(Bytes("total_badges"), Int(0)),
        App.globalPut(Bytes("total_requests"), Int(0)),
        Return(Int(1))
    ])
    
<<<<<<< HEAD
    # Student onboarding operation
    on_onboard_student = Seq([
        # Verify the caller is authorized (institution admin)
        Assert(
            And(
                Txn.sender() == Global.creator_address(),
                Txn.application_args.length() == Int(2)
            )
        ),
        
        # Verify student hash doesn't already exist
        Assert(
            App.globalGet(Concat(student_hash_key, Txn.application_args[1])) == Int(0)
        ),
        
        # Store student record in box storage for larger data
        App.box_put(
            Concat(student_hash_key, Txn.application_args[1]),
            Txn.application_args[1]
        ),
        
        # Increment total student count
        App.globalPut(
            Bytes("total_students"),
            App.globalGet(Bytes("total_students")) + Int(1)
        ),
        
        # Set timestamp using box storage for audit trail
        App.box_put(
            Concat(last_updated_key, Txn.application_args[1]),
            Itob(Global.latest_timestamp())
=======
    # Create badge request operation
    on_create_badge_request = Seq([
        # Extract badge request data from application arguments
        # App args: [operation, badge_request_json]
        Assert(Txn.application_args.length() == Int(2)),
        
        # Store badge request in global state
        App.globalPut(
            Concat(badge_request_key, Txn.application_args[1]),
            Txn.application_args[1]
        ),
        
        # Set timestamp
        App.globalPut(
            Concat(timestamp_key, Txn.application_args[1]),
            Global.latest_timestamp()
        ),
        
        # Increment total requests count
        App.globalPut(
            Bytes("total_requests"),
            App.globalGet(Bytes("total_requests")) + Int(1)
        ),
        
        Return(Int(1))
    ])
    
    # Approve badge request operation
    on_approve_badge_request = Seq([
        # Verify the caller is authorized (institution admin)
        Assert(Txn.sender() == Global.creator_address()),
        
        # Extract request ID from application arguments
        Assert(Txn.application_args.length() == Int(2)),
        
        # Update request status to approved
        App.globalPut(
            Concat(Bytes("approved"), Txn.application_args[1]),
            Bytes("approved")
        ),
        
        # Set approval timestamp
        App.globalPut(
            Concat(Bytes("approved_at"), Txn.application_args[1]),
            Global.latest_timestamp()
>>>>>>> bd4644f51370fddfbec2924ffeb18dfd08d3dcb1
        ),
        
        Return(Int(1))
    ])
    
    # Create meta badge operation (mint badge)
    on_create_meta_badge = Seq([
        # Verify the caller is authorized
        Assert(Txn.sender() == Global.creator_address()),
        
        # Extract badge data from application arguments
        Assert(Txn.application_args.length() == Int(2)),
        
        # Store badge data using badge hash as key
        App.globalPut(
            Concat(badge_data_key, Txn.application_args[1]),
            Txn.application_args[1]
        ),
        
        # Set issuance timestamp
        App.globalPut(
            Concat(timestamp_key, Txn.application_args[1]),
            Global.latest_timestamp()
        ),
        
        # Increment total badges count
        App.globalPut(
            Bytes("total_badges"),
            App.globalGet(Bytes("total_badges")) + Int(1)
        ),
        
        Return(Int(1))
    ])
    
    # Badge verification (read-only)
    on_verify_badge = Seq([
        # Anyone can verify badges (read operation)
        # Extract badge hash from application arguments
        Assert(Txn.application_args.length() == Int(2)),
        
        # Return success - actual data reading is done off-chain
        # The blockchain serves as immutable storage/verification
        Return(Int(1))
    ])
    
    # Main program logic
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.application_args[0] == Bytes("create_badge_request"), on_create_badge_request],
        [Txn.application_args[0] == Bytes("approve_badge_request"), on_approve_badge_request],
        [Txn.application_args[0] == Bytes("create_meta_badge"), on_create_meta_badge],
        [Txn.application_args[0] == Bytes("verify_badge"), on_verify_badge]
    )
    
    return program

def clear_state_program():
    """
    Clear state program - always approve
    Students should be able to remove the app from their account if needed
    """
    return Return(Int(1))

# Compile the smart contract
if __name__ == "__main__":
    import os
    import json
    
    # Compile to TEAL
    approval_teal = compileTeal(approval_program(), Mode.Application, version=8)
    clear_state_teal = compileTeal(clear_state_program(), Mode.Application, version=8)
    
    # Create contracts directory if it doesn't exist
    os.makedirs("./teal", exist_ok=True)
    
    # Write TEAL files
    with open("./teal/approval.teal", "w") as f:
        f.write(approval_teal)
    
    with open("./teal/clear.teal", "w") as f:
        f.write(clear_state_teal)
    
    # Create ARC-4 ABI specification
    abi_spec = {
        "name": "MetaCAMPUSBadgeManager",
        "description": "Smart contract for managing student badges and academic credentials",
        "methods": [
            {
                "name": "create_badge_request",
                "args": [
                    {"type": "string", "name": "request_data", "desc": "JSON string containing badge request data"}
                ],
                "returns": {"type": "void"},
                "desc": "Create a new badge request"
            },
            {
                "name": "approve_badge_request", 
                "args": [
                    {"type": "string", "name": "request_id", "desc": "ID of the request to approve"}
                ],
                "returns": {"type": "void"},
                "desc": "Approve a badge request (admin only)"
            },
            {
                "name": "create_meta_badge",
                "args": [
                    {"type": "string", "name": "badge_data", "desc": "JSON string containing badge data"}
                ],
                "returns": {"type": "void"},
                "desc": "Create/mint a new badge (admin only)"
            },
            {
                "name": "verify_badge",
                "args": [
                    {"type": "string", "name": "badge_hash", "desc": "Hash of the badge to verify"}
                ],
                "returns": {"type": "void"},
                "desc": "Verify a badge exists (read-only)"
            }
        ],
        "networks": {
            "lora-testnet": {
                "appID": 0
            }
        }
    }
    
    # Write ABI specification
    with open("./teal/contract.json", "w") as f:
        json.dump(abi_spec, f, indent=2)
    
    print("✅ TEAL files compiled successfully!")
    print("   - approval.teal")
    print("   - clear.teal") 
    print("   - contract.json (ABI specification)")
    print("\nFiles saved to ./teal/ directory")
