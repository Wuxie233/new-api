package model

import (
	"errors"
	"fmt"
	"strconv"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"

	"gorm.io/gorm"
)

// ErrRedeemFailed is returned when redemption fails due to database error
var ErrRedeemFailed = errors.New("redeem.failed")

type Redemption struct {
	Id           int            `json:"id"`
	UserId       int            `json:"user_id"`
	Key          string         `json:"key" gorm:"type:char(32);uniqueIndex"`
	Status       int            `json:"status" gorm:"default:1"`
	Name         string         `json:"name" gorm:"index"`
	Quota        int            `json:"quota" gorm:"default:100"`
	CreatedTime  int64          `json:"created_time" gorm:"bigint"`
	RedeemedTime int64          `json:"redeemed_time" gorm:"bigint"`
	Count        int            `json:"count" gorm:"-:all"` // only for api request
	UsedUserId   int            `json:"used_user_id"`
	DeletedAt    gorm.DeletedAt `gorm:"index"`
	ExpiredTime  int64          `json:"expired_time" gorm:"bigint"` // 过期时间，0 表示不过期
}

func GetAllRedemptions(startIdx int, num int) (redemptions []*Redemption, total int64, err error) {
	// 开始事务
	tx := DB.Begin()
	if tx.Error != nil {
		return nil, 0, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 获取总数
	err = tx.Model(&Redemption{}).Count(&total).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	// 获取分页数据
	err = tx.Order("id desc").Limit(num).Offset(startIdx).Find(&redemptions).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	// 提交事务
	if err = tx.Commit().Error; err != nil {
		return nil, 0, err
	}

	return redemptions, total, nil
}

func SearchRedemptions(keyword string, startIdx int, num int) (redemptions []*Redemption, total int64, err error) {
	tx := DB.Begin()
	if tx.Error != nil {
		return nil, 0, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Build query based on keyword type
	query := tx.Model(&Redemption{})

	// Only try to convert to ID if the string represents a valid integer
	if id, err := strconv.Atoi(keyword); err == nil {
		query = query.Where("id = ? OR name LIKE ?", id, keyword+"%")
	} else {
		query = query.Where("name LIKE ?", keyword+"%")
	}

	// Get total count
	err = query.Count(&total).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	// Get paginated data
	err = query.Order("id desc").Limit(num).Offset(startIdx).Find(&redemptions).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	if err = tx.Commit().Error; err != nil {
		return nil, 0, err
	}

	return redemptions, total, nil
}

func GetRedemptionById(id int) (*Redemption, error) {
	if id == 0 {
		return nil, errors.New("id 为空！")
	}
	redemption := Redemption{Id: id}
	var err error = nil
	err = DB.First(&redemption, "id = ?", id).Error
	return &redemption, err
}

func GetRedemptionByKey(key string) (*Redemption, error) {
	if key == "" {
		return nil, errors.New("key 为空")
	}
	keyCol := "`key`"
	if common.UsingPostgreSQL {
		keyCol = `"key"`
	}
	redemption := &Redemption{}
	err := DB.Where(keyCol+" = ?", key).First(redemption).Error
	return redemption, err
}

func Redeem(key string, userId int) (quota int, err error) {
	if key == "" {
		return 0, errors.New("未提供兑换码")
	}
	if userId == 0 {
		return 0, errors.New("无效的 user id")
	}
	redemption := &Redemption{}

	keyCol := "`key`"
	if common.UsingPostgreSQL {
		keyCol = `"key"`
	}
	common.RandomSleep()
	err = DB.Transaction(func(tx *gorm.DB) error {
		err := tx.Set("gorm:query_option", "FOR UPDATE").Where(keyCol+" = ?", key).First(redemption).Error
		if err != nil {
			return errors.New("无效的兑换码")
		}
		if redemption.Status != common.RedemptionCodeStatusEnabled {
			return errors.New("该兑换码已被使用")
		}
		if redemption.ExpiredTime != 0 && redemption.ExpiredTime < common.GetTimestamp() {
			return errors.New("该兑换码已过期")
		}
		err = tx.Model(&User{}).Where("id = ?", userId).Update("quota", gorm.Expr("quota + ?", redemption.Quota)).Error
		if err != nil {
			return err
		}
		redemption.RedeemedTime = common.GetTimestamp()
		redemption.Status = common.RedemptionCodeStatusUsed
		redemption.UsedUserId = userId
		err = tx.Save(redemption).Error
		return err
	})
	if err != nil {
		common.SysError("redemption failed: " + err.Error())
		return 0, ErrRedeemFailed
	}
	RecordLog(userId, LogTypeTopup, fmt.Sprintf("通过兑换码充值 %s，兑换码ID %d", logger.LogQuota(redemption.Quota), redemption.Id))
	return redemption.Quota, nil
}

func (redemption *Redemption) Insert() error {
	var err error
	err = DB.Create(redemption).Error
	return err
}

func (redemption *Redemption) SelectUpdate() error {
	// This can update zero values
	return DB.Model(redemption).Select("redeemed_time", "status").Updates(redemption).Error
}

// Update Make sure your token's fields is completed, because this will update non-zero values
func (redemption *Redemption) Update() error {
	var err error
	err = DB.Model(redemption).Select("name", "status", "quota", "redeemed_time", "expired_time").Updates(redemption).Error
	return err
}

func (redemption *Redemption) Delete() error {
	var err error
	err = DB.Delete(redemption).Error
	return err
}

func DeleteRedemptionById(id int) (err error) {
	if id == 0 {
		return errors.New("id 为空！")
	}
	redemption := Redemption{Id: id}
	err = DB.Where(redemption).First(&redemption).Error
	if err != nil {
		return err
	}
	return redemption.Delete()
}

type RefundResult struct {
	RedemptionId    int     `json:"redemption_id"`
	RedemptionKey   string  `json:"redemption_key"`
	UserId          int     `json:"user_id"`
	OriginalQuota   int     `json:"original_quota"`
	UserRemainQuota int     `json:"user_remain_quota"`
	UserUsedQuota   int     `json:"user_used_quota"`
	RefundableQuota int     `json:"refundable_quota"`
	UsedPercentage  float64 `json:"used_percentage"`
}

func CalculateRedemptionRefund(key string) (*RefundResult, error) {
	redemption, err := GetRedemptionByKey(key)
	if err != nil {
		return nil, errors.New("兑换码不存在")
	}
	if redemption.Status != common.RedemptionCodeStatusUsed {
		return nil, errors.New("该兑换码未被使用，无需退款")
	}
	if redemption.UsedUserId == 0 {
		return nil, errors.New("无法确定使用者")
	}
	user, err := GetUserById(redemption.UsedUserId, false)
	if err != nil {
		return nil, errors.New("使用者用户不存在")
	}
	refundable := redemption.Quota
	if user.Quota < refundable {
		refundable = user.Quota
	}
	if refundable < 0 {
		refundable = 0
	}
	usedPct := float64(0)
	if redemption.Quota > 0 {
		usedPct = float64(redemption.Quota-refundable) / float64(redemption.Quota) * 100
	}
	return &RefundResult{
		RedemptionId:    redemption.Id,
		RedemptionKey:   key,
		UserId:          redemption.UsedUserId,
		OriginalQuota:   redemption.Quota,
		UserRemainQuota: user.Quota,
		UserUsedQuota:   user.UsedQuota,
		RefundableQuota: refundable,
		UsedPercentage:  usedPct,
	}, nil
}

func ExecuteRedemptionRefund(key string) (*RefundResult, error) {
	result, err := CalculateRedemptionRefund(key)
	if err != nil {
		return nil, err
	}
	if result.RefundableQuota <= 0 {
		return nil, errors.New("无可退额度")
	}
	err = DB.Transaction(func(tx *gorm.DB) error {
		err := tx.Model(&User{}).Where("id = ?", result.UserId).Update("quota", gorm.Expr("quota - ?", result.RefundableQuota)).Error
		if err != nil {
			return err
		}
		keyCol := "`key`"
		if common.UsingPostgreSQL {
			keyCol = `"key"`
		}
		err = tx.Model(&Redemption{}).Where(keyCol+" = ?", key).Update("status", common.RedemptionCodeStatusDisabled).Error
		return err
	})
	if err != nil {
		return nil, err
	}
	RecordLog(result.UserId, LogTypeRefund, fmt.Sprintf("兑换码退款：扣除额度 %s，兑换码ID %d，已使用 %.1f%%",
		logger.LogQuota(result.RefundableQuota), result.RedemptionId, result.UsedPercentage))
	return result, nil
}

func DeleteInvalidRedemptions() (int64, error) {
	now := common.GetTimestamp()
	result := DB.Where("status IN ? OR (status = ? AND expired_time != 0 AND expired_time < ?)", []int{common.RedemptionCodeStatusUsed, common.RedemptionCodeStatusDisabled}, common.RedemptionCodeStatusEnabled, now).Delete(&Redemption{})
	return result.RowsAffected, result.Error
}
