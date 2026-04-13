import os, re

files_to_patch = [
    'src/main/java/com/venueon/host/adapter/out/persistence/repository/HostEventJpaRepository.java',
    'src/main/java/com/venueon/event/adapter/out/persistence/repository/EventJpaRepository.java',
    'src/main/java/com/venueon/order/adapter/out/persistence/repository/OrderJpaRepository.java',
    'src/main/java/com/venueon/event/adapter/out/persistence/EventPersistenceAdapter.java'
]

for file in files_to_patch:
    with open(file, 'r') as f:
        content = f.read()
    
    # Repositories
    content = content.replace('.statusName =', '.code =')
    content = content.replace('.typeName =', '.code =')
    content = content.replace('.statusName IN', '.code IN')
    
    # EventPersistenceAdapter
    content = content.replace('root.get("status").get("statusName")', 'root.get("status").get("code")')
    content = content.replace('root.get("type").get("typeName")', 'root.get("type").get("code")')
    
    with open(file, 'w') as f:
        f.write(content)
