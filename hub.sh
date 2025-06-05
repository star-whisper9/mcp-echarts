#!/bin/bash

# 获取当天特定作者的提交哈希
# 修改since统计其他时间，例如since 7 days ago表示七天内，2024-10-01 00:00的格式指定特定时间
commits=$(git log --author="starwhisper9" --since="00:00" --until="23:59" --pretty=format:"%H")
# commits=$(git log --author="starwhisper9" --since="2 days ago")

# 初始化行数统计
total_added=0
total_deleted=0

# 遍历每个提交哈希
for commit in $commits; do
    # 获取提交的行数变化
    stats=$(git show --stat --oneline $commit | grep "files changed")

    # 提取添加和删除的行数
    added=$(echo $stats | perl -nle 'print $1 if /(\d+) insertions/')
    deleted=$(echo $stats | perl -nle 'print $1 if /(\d+) deletions/')

    # 如果没有匹配到，设置为0
    added=${added:-0}
    deleted=${deleted:-0}

    # 累加行数
    total_added=$((total_added + added))
    total_deleted=$((total_deleted + deleted))
done

# 输出结果
echo "Total lines added: $total_added"
echo "Total lines deleted: $total_deleted"
