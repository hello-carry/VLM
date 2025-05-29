import csv

# 测试图片链接
img_urls = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80"
]

input_file = "evt001.csv"
output_file = "evt001_imgtest.csv"

with open(input_file, "r", encoding="utf-8") as fin, open(output_file, "w", encoding="utf-8", newline='') as fout:
    reader = csv.reader(fin)
    writer = csv.writer(fout)
    header = next(reader)
    writer.writerow(header)
    frame_url_idx = header.index("evt_frame_url")
    for i, row in enumerate(reader):
        row[frame_url_idx] = img_urls[i % len(img_urls)]
        writer.writerow(row)

print("图片链接批量替换完成，结果已保存到", output_file)