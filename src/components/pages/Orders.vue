<template>
	<div>
		<el-breadcrumb separator="/">
			<el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item><a href="javascript:;">订单列表</a></el-breadcrumb-item>
		</el-breadcrumb>
		<div class="app-container">
			<!-- 订单列表 -->
			<el-table
				:data="orderData"
				border
				row-key="subordernumber"
                style="width: 100%"
			>
				<el-table-column
					label="订单编号"
					width="230"
				>
					<template slot-scope="scope">
						{{ scope.row.ordernumber }}
					</template>
				</el-table-column>
				<el-table-column
					label="交易号"
					width="250"
				>
					<template slot-scope="scope">
						{{ scope.row.tradeno }}
					</template>
				</el-table-column>
				<el-table-column
					label="会员昵称"
					width="100"
				>
					<template slot-scope="scope">
						{{ scope.row.nickname }}
					</template>
				</el-table-column>
				<el-table-column
					label="会员联系方式"
					width="130"
				>
					<template slot-scope="scope">
						{{ scope.row.phone }}
					</template>
				</el-table-column>
				<el-table-column
					label="商品数量"
					width="80"
				>
					<template slot-scope="scope">
						{{ scope.row.countnumber }}
					</template>
				</el-table-column>
				<el-table-column
					label="支付金额"
					width="80"
				>
					<template slot-scope="scope">
						{{ scope.row.countmoney }}
					</template>
				</el-table-column>
				<el-table-column
					label="下单时间"
					width="220"
				>
					<template slot-scope="scope">
						{{ scope.row.addtime }}
					</template>
				</el-table-column>
				<el-table-column
					label="状态"
					width="100"
				>
					<template slot-scope="scope">
						<el-tag
							effect="dark"
							type="warning"
							v-if="scope.row.status==0"
						>待支付</el-tag>
						<el-tag
							effect="dark"
							type="success"
							v-else-if="scope.row.status==1"
						>待发货</el-tag>
						<el-tag
							effect="dark"
							type="info"
							v-else-if="scope.row.status==2"
						>待收货</el-tag>
						<el-tag
							effect="dark"
							type="danger"
							v-else
						>禁用</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="操作">
					<template slot-scope="scope">
						<el-button
							v-if="scope.row.status==0"
							size="mini"
						>提醒付款</el-button>
						<el-button
							v-if="scope.row.status==1"
							size="mini"
							type="danger"
							@click="handleEdit(scope.row)"
						>确认发货</el-button>
						<el-button
							v-if="scope.row.status==2"
							size="mini"
						>提醒收货</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				background
				layout="prev, pager, next"
				:page-size="pagesize"
				:page-count="pagecount"
				@current-change="handleCurrentChange"
			>
			</el-pagination>
		</div>
		<!-- 轮播图添加/修改 -->
		<el-dialog
			:title="'订单'+tip"
			:visible.sync="infoVisible"
			@close="handleReset"
		>
			<el-form
				:model="form"
				ref="form"
				label-width="100px"
				class="demo-form"
			>	<el-form-item
					label="快递公司"
					prop="couriercode"
				>
					<el-select
						v-model="form.couriercode"
						placeholder="请选择快递"
					>
						<el-option
							value="0"
							label="快递公司"
						></el-option>
						<el-option
							v-for="item in courier"
							:key="item.id"
							:label="item.companyname"
							:value="item.companycode"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item
					label="订单物流号"
					prop="couriernumber"
				>
					<el-input v-model="form.couriernumber"></el-input>
				</el-form-item>
			</el-form>
            <div
				slot="footer"
				class="dialog-footer"
			>
				<el-button @click="handleReset('form')">取 消</el-button>
				<el-button
					type="primary"
					@click="handleSubmit('form')"
				>确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
export default {
	data() {
		return {
			orderData: [],//订单数据
			courier:[],//物流数据
			pagesize:8,
			page:1,
			pagecount:0,
			infoVisible: false,
			formLabelWidth: '120px',
			tip: '添加',
			form: {
				couriernumber: '',
				couriercode: ''
			}
		}
	},
	methods: {
		// 切换页码
		handleCurrentChange: function (currentPage) {
		    this.page = currentPage;
		    this.getPage();
		},
		//获取订单数据
		getPage(){
			this.http.get('/api/orderall', { size: this.pagesize, page: this.page }).then(res => {
				this.pagecount = res.list.totalPage;
				this.orderData = res.list.orderData || []
				console.log(this.pagecount,this.orderData,1111)
			})
		},
		// 修改订单状态
		handleEdit(row) {
			this.infoVisible = true;
			// console.log(row)
			let id = row.id;
			this.tip = '修改';
			this.form.id = id;
			this.form.status = 2;
			// 获取物流公司信息
			this.http.get('/api/courier').then(res => {
				this.courier = res.list;
			})
		},
		handleSubmit(formName) {
			let that = this;
			this.$refs[formName].validate(valid => {
				this.axios({
				    method:'post',
				    url:"/api/orderedit",
				    data:that.form,
				}).then(res=>{
				    res = res.data;
				    if (res.code == 200) {
						this.$message({
							showClose: true,
							message: res.msg,
							type: 'success'
						});
						this.getPage();
						this.infoVisible = false;
					} else {
						this.$message({
							showClose: true,
							message: res.msg,
							type: 'error'
						});
					}
				})
			});
		},
		handleReset() {
			this.infoVisible = false;
			this.tip = '编辑';
			this.form = {
		      couriernumber: '',
		      couriercode: ''
			};
		    this.$(".el-upload-list--picture-card").html("");
		    
		},
	},
	mounted() {
		// 获取订单数据
		this.getPage();
	}
}
</script>

<style>
</style>