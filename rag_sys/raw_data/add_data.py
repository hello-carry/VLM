import csv
from datetime import datetime, timedelta

# 读取原始数据
with open('evt001.csv', 'r', encoding='utf-8') as f:
    reader = list(csv.reader(f))
    header = reader[0]
    rows = reader[1:]

# 需要补充的条数
total = 128
current = len(rows)
start_time = datetime.strptime(rows[-1][1], "%Y-%m-%d %H:%M:%S")

# 事件类型和描述可循环
evt_types = ["人员闯入", "物品遗留", "安全违规", "车辆违规", "设备异常", "火灾隐患", "人员聚集", "动物闯入", "系统告警", "照明故障"]
evt_descs = [
    "围栏东侧有1名未授权人员翻越", "大厅沙发遗留黑色背包", "操作员未戴护目镜切割金属", "车牌A12345在消防通道停车",
    "3号电梯门反复开合", "仓库发现烟头", "南门5人争执推搡", "野猫进入配电房", "门禁系统频繁误报", "B区走廊灯常亮"
]
evt_fix_descs = [
    "经核实为维修人员未佩戴标识", "包内为笔记本电脑，已联系失主", "已现场纠正并记录", "车主为访客，已移车教育",
    "传感器故障，已停用报修", "系保洁人员违规吸烟", "促销活动排队纠纷", "已驱离并封堵漏洞", "电源电压不稳导致", "感应器灵敏度需调整"
]

# 补全数据
for i in range(current+1, total+1):
    evt_id = f"EV-20240501-{i:03d}"
    evt_time = (start_time + timedelta(minutes=5*i)).strftime("%Y-%m-%d %H:%M:%S")
    evt_duration = str(30 + (i % 300))
    evt_frame_url = f"http://storage.example.com/frames/{i:03d}.jpg"
    evt_video_url = f"http://storage.example.com/videos/20240501_{i:06d}.mp4"
    idx = (i-1) % len(evt_types)
    row = [
        evt_id, evt_time, evt_duration, evt_frame_url, evt_video_url,
        evt_types[idx], evt_descs[idx], evt_fix_descs[idx]
    ]
    rows.append(row)

# 写回csv
with open('evt001_full.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(rows)

print("补全完成，已生成 evt001_full.csv")