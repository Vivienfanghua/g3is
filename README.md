# g3is project.

### 0.Installation.
 * ./run.sh

###  1.返回所有的冲突区域
 * @example http://127.0.0.1:3000/get_all_conflict_codes
 * @return JSON array.

###  2.返回当前时刻的所有冲突数据
  * @param req.query.time int
  * @example http://127.0.0.1:3000/get_current_data?time=55
  * @return JSON array.

###  3.返回指定目标的信息
   * @param req.query.dataid int
   * @param req.query.time int
   * @example http://127.0.0.1:3000/get_barrier_info?dataid=8&time=6197
   * @return JSON object.
