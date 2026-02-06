import chalk from 'chalk';

// Các màu và định dạng
const colors = {
  info: chalk.blue,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  dbInfo: chalk.cyan,
  serverInfo: chalk.magenta
};

// Hiển thị thời gian
const timestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString('vi-VN');
};

// Hàm xử lý SQL để hiển thị gọn gàng hơn
const formatSql = (sql: string): string => {
  // Cắt ngắn SQL nếu quá dài
  if (sql.length > 80) {
    sql = sql.substring(0, 80) + '...';
  }
  
  // Loại bỏ "Executing (default):" nếu có
  if (sql.startsWith('Executing (default):')) {
    sql = sql.replace('Executing (default):', '').trim();
  }
  
  return sql;
};

// Các loại log
export const logger = {
  // Log thông tin bình thường
  info: (message: string) => {
    console.log(`${colors.info('ℹ️  INFO')} [${timestamp()}] ${message}`);
  },

  // Log thành công
  success: (message: string) => {
    console.log(`${colors.success('✅  THÀNH CÔNG')} [${timestamp()}] ${message}`);
  },

  // Log cảnh báo
  warning: (message: string) => {
    console.log(`${colors.warning('⚠️  CẢNH BÁO')} [${timestamp()}] ${message}`);
  },

  // Log lỗi
  error: (message: string, error?: any) => {
    console.log(`${colors.error('❌  LỖI')} [${timestamp()}] ${message}`);
    if (error) {
      console.error(error);
    }
  },

  // Log liên quan đến database
  db: {
    info: (message: string) => {
      console.log(`${colors.dbInfo('🗃️  DATABASE')} [${timestamp()}] ${message}`);
    },
    query: (sql: string) => {
      console.log(`${colors.dbInfo('🔍  SQL')} [${timestamp()}] ${formatSql(sql)}`);
    },
    connecting: () => {
      console.log(`${colors.dbInfo('🗃️  DATABASE')} [${timestamp()}] Đang kết nối đến cơ sở dữ liệu...`);
    },
    connected: () => {
      console.log(`${colors.dbInfo('🗃️  DATABASE')} [${timestamp()}] Kết nối cơ sở dữ liệu thành công.`);
    },
    error: (error: any) => {
      console.log(`${colors.error('❌  DATABASE')} [${timestamp()}] Không thể kết nối đến cơ sở dữ liệu.`);
      console.error(error);
    },
    synchronized: () => {
      console.log(`${colors.dbInfo('🗃️  DATABASE')} [${timestamp()}] Đồng bộ hóa model thành công.`);
    }
  },

  // Log liên quan đến server
  server: {
    starting: () => {
      console.log(`${colors.serverInfo('🚀  SERVER')} [${timestamp()}] Đang khởi động server...`);
    },
    started: (port: number) => {
      console.log('\n' + chalk.bold('='.repeat(50)));
      console.log(`${colors.success('✅  SERVER')} [${timestamp()}] Server đã khởi động thành công trên cổng ${port}`);
      console.log(chalk.bold('='.repeat(50)) + '\n');
    }
  }
}; 