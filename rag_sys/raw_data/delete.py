from pymilvus import connections, utility

connections.connect("default", host="localhost", port="19530")

collections = utility.list_collections()
print("当前所有表：", collections)

for name in collections:
    utility.drop_collection(name)
    print(f"已删除表: {name}")

print("所有表已清空。")