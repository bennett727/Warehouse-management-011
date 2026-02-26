const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../src/components');

function addDataCyToSelect(fileContent, fileName) {
  const matches = fileContent.match(/<el-select[^>]*v-model="([^"]+)"[^>]*>/g);
  if (!matches) return fileContent;

  let modifiedContent = fileContent;
  
  matches.forEach(match => {
    if (!match.includes('data-cy')) {
      const vModelMatch = match.match(/v-model="([^"]+)"/);
      if (vModelMatch) {
        const vModel = vModelMatch[1];
        let dataCyName = '';
        
        if (fileName.includes('ReturnDetailForm')) {
          dataCyName = `return-${vModel.replace(/([A-Z])/g, '-$1').toLowerCase()}-select`;
        } else if (fileName.includes('TransferInboundDetailForm')) {
          dataCyName = `transfer-inbound-${vModel.replace(/([A-Z])/g, '-$1').toLowerCase()}-select`;
        } else if (fileName.includes('InboundDeviceForm')) {
          dataCyName = `inbound-device-${vModel.replace(/([A-Z])/g, '-$1').toLowerCase()}-select`;
        } else if (fileName.includes('InboundCreationWizard')) {
          dataCyName = `inbound-wizard-${vModel.replace(/([A-Z])/g, '-$1').toLowerCase()}-select`;
        } else if (fileName.includes('OutboundCreationWizard')) {
          dataCyName = `outbound-wizard-${vModel.replace(/([A-Z])/g, '-$1').toLowerCase()}-select`;
        } else if (fileName.includes('WarehouseInitWizard')) {
          dataCyName = `warehouse-init-${vModel.replace(/([A-Z])/g, '-$1').toLowerCase()}-select`;
        }
        
        if (dataCyName) {
          modifiedContent = modifiedContent.replace(
            match,
            `${match.replace('>', '')} data-cy="${dataCyName}">`
          );
        }
      }
    }
  });
  
  return modifiedContent;
}

function addDataCyToInput(fileContent, fileName) {
  const matches = fileContent.match(/<el-input[^>]*v-model="([^"]+)"[^>]*>/g);
  if (!matches) return fileContent;

  let modifiedContent = fileContent;
  
  matches.forEach(match => {
    if (!match.includes('data-cy') && !match.includes('disabled')) {
      const vModelMatch = match.match(/v-model="([^"]+)"/);
      if (vModelMatch) {
        const vModel = vModelMatch[1];
        let dataCyName = '';
        
        if (fileName.includes('InboundDeviceForm')) {
          dataCyName = `inbound-device-${vModel.replace(/([A-Z])/g, '-$1').toLowerCase()}-input`;
        } else if (fileName.includes('administrative-division')) {
          dataCyName = `admin-division-${vModel.replace(/([A-Z])/g, '-$1').toLowerCase()}-input`;
        }
        
        if (dataCyName) {
          modifiedContent = modifiedContent.replace(
            match,
            `${match.replace('>', '')} data-cy="${dataCyName}">`
          );
        }
      }
    }
  });
  
  return modifiedContent;
}

function addDataCyToTable(fileContent, fileName) {
  const matches = fileContent.match(/<el-table[^>]*:data="([^"]+)"[^>]*>/g);
  if (!matches) return fileContent;

  let modifiedContent = fileContent;
  
  matches.forEach(match => {
    if (!match.includes('data-cy')) {
      const dataMatch = match.match(/:data="([^"]+)"/);
      if (dataMatch) {
        const dataProp = dataMatch[1];
        let dataCyName = '';
        
        if (fileName.includes('InboundDeviceForm')) {
          dataCyName = 'inbound-device-list-table';
        } else if (fileName.includes('WarehouseInitWizard')) {
          dataCyName = 'warehouse-init-zones-table';
        } else if (fileName.includes('Dashboard')) {
          dataCyName = 'dashboard-activity-table';
        }
        
        if (dataCyName) {
          modifiedContent = modifiedContent.replace(
            match,
            `${match.replace('>', '')} data-cy="${dataCyName}">`
          );
        }
      }
    }
  });
  
  return modifiedContent;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    let modified = false;
    
    const originalContent = content;
    
    content = addDataCyToSelect(content, fileName);
    if (content !== originalContent) modified = true;
    
    content = addDataCyToInput(content, fileName);
    if (content !== originalContent) modified = true;
    
    content = addDataCyToTable(content, fileName);
    if (content !== originalContent) modified = true;
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ 已处理: ${fileName}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`✗ 处理失败 ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  let processedCount = 0;
  
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processedCount += processDirectory(filePath);
    } else if (file.endsWith('.vue')) {
      if (processFile(filePath)) {
        processedCount++;
      }
    }
  }
  
  return processedCount;
}

console.log('🔍 开始批量添加 data-cy 属性...\n');
const processed = processDirectory(componentsDir);
console.log(`\n✅ 处理完成！共处理 ${processed} 个文件`);
