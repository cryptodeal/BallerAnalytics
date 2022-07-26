rm -f A3C_Data/*.txt
mkdir -p A3C_Data
mkdir -p A3C_Data/temporary-global-model-actor
mkdir -p A3C_Data/temporary-global-model-critic
mkdir -p A3C_Data/global-model-actor
mkdir -p A3C_Data/global-model-critic
cd A3C_Data
touch queue.txt global_moving_average.txt best_score.txt global_episode.txt workers_tokens.txt
echo 0 > global_moving_average.txt
echo 0 > global_episode.txt
echo 0 > best_score.txt