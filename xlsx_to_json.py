import pandas as pd
import json

# 读取Excel文件
# 修改文件路径
df = pd.read_excel('D:\\火狐\\下载\\video1.2.xlsx')

# 创建一个包含视频信息的列表
videos = []

for index, row in df.iterrows():

    video = {
        # row['表格的表头（好像是叫这名）']
        "videoLink": row['playlist-show-links href'],
        "playLink": row['playlist-show-links src'],
        "coverImage": row['playlist-show-links src'],
        "title": row['home-rows-videos-title'],
        "description": "无",
        "protagonist": "无",
        "tags": ["全部","动漫"],
        "rating": 3
    }
    videos.append(video)
# 创建最终的 JSON 数据
output_json = {
    "videos": videos
}

# 将 JSON 数据写入文件
with open('output.json', 'w', encoding='utf-8') as json_file:
    json.dump(output_json, json_file, ensure_ascii=False, indent=4)

print("JSON 文件已生成")
